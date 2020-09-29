package egg.em.kotlin.network.repositories

import egg.em.kotlin.network.api.AuthApi
import egg.em.kotlin.network.data.request.LoginData
import egg.em.kotlin.network.data.response.Resource
import net.simplifiedcoding.data.UserPreferences

class AuthRepository (
    private val api : AuthApi,
    private val preferences: UserPreferences
) : BaseRepository () {
    suspend fun login(email : String, password: String) : Resource<String> {
        val data = LoginData(email, password)
        return safeApiCall {
            api.login(data)
        }
    }

    suspend fun saveAuthToken(token: String){
        preferences.saveAuthToken(token)
    }
}