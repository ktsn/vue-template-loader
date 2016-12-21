let uid = 0
const uidRegistry = Object.create(null)

module.exports = function genId (filePath) {
  return uidRegistry[filePath] || (uidRegistry[filePath] = ++uid)
}
