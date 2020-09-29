package egg.em.kotlin.ui.viewModels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import egg.em.kotlin.network.data.response.Resource
import egg.em.kotlin.network.repositories.DashboardRepository
import kotlinx.coroutines.launch

class DashboardViewModel(private val repository: DashboardRepository) : ViewModel() {

    private val _lastTest: MutableLiveData<Resource<String>> = MutableLiveData()
    val lastTest: LiveData<Resource<String>> get() = _lastTest

    fun getLastTest(id: Int) =
        viewModelScope.launch { _lastTest.value = repository.getLastTest(id) }
}