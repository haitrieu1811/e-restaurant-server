import { ArgumentMetadata, Injectable, PipeTransform, UnprocessableEntityException } from '@nestjs/common'
import { createZodValidationPipe } from 'nestjs-zod'

const CustomValidationPipeClass = createZodValidationPipe({
  createValidationException: (error: any) => {
    return new UnprocessableEntityException(
      error.issues?.map((err: any) => ({
        path: err.path.join('.'),
        message: err.message
      })) ?? error
    )
  }
})

const basePipe = new CustomValidationPipeClass()

@Injectable()
export class CustomZodValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    return basePipe.transform(value, metadata)
  }
}

export default CustomZodValidationPipe
