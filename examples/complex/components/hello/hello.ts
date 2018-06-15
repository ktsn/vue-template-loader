import Template from './hello.functional.pug?style=./hello.scss'

export default Template({
  functional: true,

  props: {
    text: {
      type: String,
      required: true
    }
  }
})
