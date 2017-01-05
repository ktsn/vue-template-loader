import template from './app.html?style=./app.css'
import CssModules from '../css-modules/css-modules'

export default template({
  data () {
    return {
      message: 'Hi'
    }
  },
  components: {
    CssModules
  }
})
