interface Error {
    status?: number
    name?: string
    message?: string
    stack?: string
  }
  // type e = Required<Error>
  export default Error