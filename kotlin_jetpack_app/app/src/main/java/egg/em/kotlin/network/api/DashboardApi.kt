package egg.em.kotlin.network.api

import retrofit2.http.Field
import retrofit2.http.GET

interface DashboardApi {

    @GET("api/tests/lasttest/:id")
    suspend fun getLastTest(@Field("id") id : Int) : String

}