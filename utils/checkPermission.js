import { UnethenticatedError } from '../error'

const checkPermissions = async(requestUser, resourceUserId) => {
  if (requestUser.userId === resourceUserId.toString()) return
  throw new UnethenticatedError('Not authorized to access this route')
}

module.exports=checkPermissions