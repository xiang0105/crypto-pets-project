import { ref } from 'vue'

const availableSkillPoints = ref(0)

function grantSkillPoints(points: number) {
  availableSkillPoints.value += Math.max(0, points)
}

function spendSkillPoint() {
  if (availableSkillPoints.value <= 0) {
    return false
  }

  availableSkillPoints.value -= 1
  return true
}

function resetTestProgress() {
  availableSkillPoints.value = 0
}

export {
  availableSkillPoints,
  grantSkillPoints,
  resetTestProgress,
  spendSkillPoint,
}
