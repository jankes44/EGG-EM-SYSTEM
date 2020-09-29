package egg.em.kotlin.ui.viewModels

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import egg.em.kotlin.network.data.response.Resource
import egg.em.kotlin.network.repositories.AuthRepository
import kotlinx.coroutines.launch

class AuthViewModel (private val repository: AuthRepository) : ViewModel() {

    private val _loginResponse: MutableLiveData<Resource<String>> = MutableLiveData()
    val loginResponse: LiveData<Resource<String>> get() = _loginResponse

    fun login(
        email: String,
        password: String
    ) = viewModelScope.launch {
        _loginResponse.value = repository.login(email, password)
    }

    fun saveAuthToken(token: String) = viewModelScope.launch {
        repository.saveAuthToken(token)
    }
}