import changePassword from '@/tools/accounts/changePassword'
import loginUser from '@/tools/accounts/loginUser'
import logOutUser from '@/tools/accounts/logOutUser'
import signUpUser from '@/tools/accounts/signUpUser'

const supabaseAccountActions = {
  changePassword,
  loginUser,
  logOutUser,
  signUpUser
}

export default supabaseAccountActions
