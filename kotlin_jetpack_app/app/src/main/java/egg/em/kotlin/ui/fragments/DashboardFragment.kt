package egg.em.kotlin.ui.fragments

import android.os.Bundle
import android.view.LayoutInflater
import android.view.ViewGroup
import androidx.lifecycle.lifecycleScope
import com.auth0.android.jwt.JWT
import egg.em.kotlin.databinding.DashboardFragmentBinding
import egg.em.kotlin.network.api.DashboardApi
import egg.em.kotlin.network.repositories.DashboardRepository
import egg.em.kotlin.ui.base.BaseFragment
import egg.em.kotlin.ui.viewModels.DashboardViewModel
import kotlinx.coroutines.InternalCoroutinesApi
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking

class DashboardFragment : BaseFragment<DashboardViewModel, DashboardFragmentBinding, DashboardRepository>() {

    @InternalCoroutinesApi
    override fun onActivityCreated(savedInstanceState: Bundle?) {
        super.onActivityCreated(savedInstanceState)
        lifecycleScope.launch { userPreferences.authToken.first() }

        val token = runBlocking { userPreferences.authToken.first() }
        val username = JWT(token.toString()).claims["first_name"]

        binding.welcome.text = String.format(binding.welcome.text.toString(), username)
        binding.areaNamePlaceholder.text = "Scottish Parliament"


    }

    override fun getViewModel(): Class<DashboardViewModel> = DashboardViewModel::class.java

    override fun getFragmentBinding(
        inflater: LayoutInflater,
        container: ViewGroup?
    ): DashboardFragmentBinding =
        DashboardFragmentBinding.inflate(inflater, container, false)

    override fun getFragmentRepository(): DashboardRepository {
        val token = runBlocking { userPreferences.authToken.first() }
        return DashboardRepository(remoteDataSource.buildApi(DashboardApi::class.java, token))
    }

}