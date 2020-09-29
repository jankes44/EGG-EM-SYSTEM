package egg.em.kotlin.network.api

import egg.em.kotlin.network.data.request.LoginData
import retrofit2.http.Body
import retrofit2.http.POST

interface AuthApi  {

    @POST("users/login/")
    suspend fun login(@Body loginData: LoginData) : String
}