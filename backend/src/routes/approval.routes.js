const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { authenticate, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const Joi = require('joi');

const prisma = new PrismaClient();

// Get workflows for a SOP
router.get('/sop/:sopId',
  authenticate,
  asyncHandler(async (req, res) => {
    const workflows = await prisma.approvalWorkflow.findMany({
      where: { sopId: req.params.sopId },
      include: {
        actions: {
          include: {
            actor: {
              select: {
                id: true,
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { stepNumber: 'asc' }
        }
      },
      orderBy: { startedAt: 'desc' }
    });

    res.json({
      success: true,
      data: workflows
    });
  })
);

// Create approval workflow
router.post('/',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (req, res) => {
    const { sopId, workflowName, actions } = req.body;

    const workflow = await prisma.$transaction(async (tx) => {
      const newWorkflow = await tx.approvalWorkflow.create({
        data: {
          sopId,
          workflowName,
          totalSteps: actions.length,
          status: 'PENDING'
        }
      });

      await tx.approvalAction.createMany({
        data: actions.map((action, index) => ({
          workflowId: newWorkflow.id,
          stepNumber: index + 1,
          actionType: action.actionType,
          actorId: action.actorId,
          status: index === 0 ? 'PENDING' : 'PENDING'
        }))
      });

      return newWorkflow;
    });

    res.status(201).json({
      success: true,
      message: 'Approval workflow created',
      data: workflow
    });
  })
);

// Take approval action
router.post('/:workflowId/action',
  authenticate,
  asyncHandler(async (req, res) => {
    const { workflowId } = req.params;
    const { actionType, comments } = req.body;

    const workflow = await prisma.approvalWorkflow.findUnique({
      where: { id: workflowId },
      include: {
        actions: {
          where: {
            stepNumber: { lte: workflow => workflow.currentStep }
          },
          orderBy: { stepNumber: 'asc' }
        }
      }
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found'
      });
    }

    // Find current action for this user
    const currentAction = await prisma.approvalAction.findFirst({
      where: {
        workflowId,
        stepNumber: workflow.currentStep,
        actorId: req.user.id,
        status: 'PENDING'
      }
    });

    if (!currentAction) {
      return res.status(403).json({
        success: false,
        message: 'No pending action for you in this workflow'
      });
    }

    // Update action
    await prisma.approvalAction.update({
      where: { id: currentAction.id },
      data: {
        status: 'COMPLETED',
        actionType,
        comments,
        actionDate: new Date()
      }
    });

    // Update workflow
    const isLastStep = workflow.currentStep >= workflow.totalSteps;
    const workflowStatus = actionType === 'APPROVE' 
      ? (isLastStep ? 'APPROVED' : 'IN_PROGRESS')
      : 'REJECTED';

    await prisma.approvalWorkflow.update({
      where: { id: workflowId },
      data: {
        status: workflowStatus,
        currentStep: isLastStep ? workflow.currentStep : workflow.currentStep + 1,
        completedAt: isLastStep ? new Date() : null
      }
    });

    // Update SOP status if workflow completed
    if (isLastStep) {
      await prisma.sOPDocument.update({
        where: { id: workflow.sopId },
        data: {
          status: actionType === 'APPROVE' ? 'APPROVED' : 'REJECTED'
        }
      });
    }

    res.json({
      success: true,
      message: 'Action recorded successfully'
    });
  })
);

module.exports = router;
