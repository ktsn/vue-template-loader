import Vue from 'vue'
import Component from 'vue-class-component'
import Template from './app.pug?style=./app.scss'
import Hello from '../hello/hello'

@Template
@Component({
  components: {
    Hello
  }
})
export class App extends Vue {
  message = 'Hello Vue.js!'
}
