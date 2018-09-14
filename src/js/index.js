import util from 'js/util'
import 'css/style.less'

const component = () => {
  const div = document.createElement('div')
  div.innerHTML = 'hello world'
  div.classList.add('hello')
  util.hello()
  return div
}

document.body.appendChild(component())