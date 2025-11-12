import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

const bpsTheme = {
  dark: false,
  colors: {
    primary: '#1976D2',    // Blue - BPS Brand Color
    secondary: '#424242',  // Grey
    accent: '#82B1FF',
    error: '#FF5252',
    info: '#2196F3',
    success: '#4CAF50',
    warning: '#FFC107',
    background: '#F5F5F5',
    surface: '#FFFFFF'
  }
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'bpsTheme',
    themes: {
      bpsTheme
    }
  },
  defaults: {
    VBtn: {
      elevation: 2,
      rounded: 'md'
    },
    VCard: {
      elevation: 2,
      rounded: 'lg'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable'
    }
  }
})
