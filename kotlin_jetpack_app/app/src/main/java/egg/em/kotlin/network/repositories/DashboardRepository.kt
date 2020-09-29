package egg.em.kotlin.network.repositories

import egg.em.kotlin.network.api.AuthApi
import egg.em.kotlin.network.api.DashboardApi
import egg.em.kotlin.network.data.response.Resource
import net.simplifiedcoding.data.UserPreferences

class DashboardRepository(private val api : DashboardApi) : BaseRepository () {
    suspend fun getLastTest(id : Int) : Resource<String>
            = safeApiCall { api.getLastTest(id) }

}