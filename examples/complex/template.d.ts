declare module '*.scss' {
  import Vue, { ComponentOptions, FunctionalComponentOptions } from 'vue'
  interface Template {
    <V extends Vue, U extends ComponentOptions<V> | FunctionalComponentOptions>(options: U): U
    <V extends typeof Vue>(component: V): V
  }
  const template: Template
  export default template
}
