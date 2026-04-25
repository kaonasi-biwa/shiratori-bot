export class GeneralError extends Error {
  constructor() {
    super();

    // this.name = this.constructor.name; でも問題ないが、
    // enumerable を false にしたほうがビルトインエラーに近づく、
    Object.defineProperty(this, 'name', {
      configurable: true,
      enumerable: false,
      value: this.constructor.name,
      writable: true,
    });

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, GeneralError);
    }
    this.message = "General Error"
  }
}

export class UnfinishedTaskError extends GeneralError {
  constructor(){
    super()
    this.message = "Left unfinished tasks"
  }
}
export class NotExistError extends GeneralError {
  constructor(){
    super()
    this.message = "It doesn's not exit"
  }
}
export class UnknownWorkbookError extends GeneralError {
  constructor(){
    super()
    this.message = "The workbook doesn's not exit"
  }
}
export class UnknownSubjectError extends GeneralError {
  constructor(){
    super()
    this.message = "The subject doesn's not exit"
  }
}
