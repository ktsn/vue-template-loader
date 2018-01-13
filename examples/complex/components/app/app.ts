import Vue from 'vue'
import Component from 'vue-class-component'
import Template from './app.pug?style=./app.scss'

@Template
@Component
export class App extends Vue {
  message = 'Hello Vue.js!'
}
