var uid = 0
var uidRegistry = Object.create(null)

module.exports = function genId (filePath) {
  return uidRegistry[filePath] || (uidRegistry[filePath] = ++uid)
}
