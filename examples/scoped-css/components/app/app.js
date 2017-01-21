import template from './app.html?style=./app.css'

export default template({
  data () {
    return {
      message: 'This style should be scoped'
    }
  }
})
