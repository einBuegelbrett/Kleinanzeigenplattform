import vine from '@vinejs/vine'

export const searchbar = vine.compile(
  vine.object({
    search: vine.string().trim().maxLength(50).nullable(),
  })
)

// vine.array doesn't work with a single file, 'group: solves this issue by testing if the data is an array or not: https://vinejs.dev/docs/types/object#object-groups
const fileSchema = vine.file({
  size: '10mb',
  extnames: ['jpg', 'png', 'pdf']
});

const images = vine.group([
  vine.group.if((data) => Array.isArray(data.images), {
    images: vine.array(fileSchema)
  }),
  vine.group.else({
    images: fileSchema
  })
])

export const submitItem = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(50),
    price: vine.number().range([0, 9999999999.99]).positive().transform((value) => value.toFixed(2).toString()),
    description: vine.string().trim().minLength(1).maxLength(250),
  }).merge(images)
)
