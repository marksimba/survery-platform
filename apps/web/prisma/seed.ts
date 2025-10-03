import { PrismaClient, SurveyStatus, QuestionType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Upsert demo user
  const owner = await prisma.user.upsert({
    where: { email: 'owner@example.com' },
    update: {},
    create: {
      email: 'owner@example.com',
      name: 'Owner',
    },
  })

  // Create or find example survey
  const survey = await prisma.survey.upsert({
    where: { slug: 'example' },
    update: {},
    create: {
      title: 'Example Survey',
      description: 'A demo survey seeded for development.',
      slug: 'example',
      status: SurveyStatus.PUBLISHED,
      ownerId: owner.id,
    },
  })

  // Clear existing questions for idempotency
  await prisma.question.deleteMany({ where: { surveyId: survey.id } })

  // Seed questions
  const questions = [
    { type: QuestionType.SHORT_TEXT, title: 'What is your name?', required: true },
    { type: QuestionType.EMAIL, title: 'What is your email address?', required: true },
    { type: QuestionType.LONG_TEXT, title: 'Tell us about yourself', required: false },
  ]

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i]
    await prisma.question.create({
      data: {
        surveyId: survey.id,
        type: q.type,
        title: q.title,
        required: q.required,
        order: i + 1,
        config: {},
      },
    })
  }

  console.log('Seed complete. Survey slug: example')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
}).finally(async () => {
  await prisma.$disconnect()
})