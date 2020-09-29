package egg.em.kotlin.ui.base

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import egg.em.kotlin.network.repositories.AuthRepository
import egg.em.kotlin.network.repositories.BaseRepository
import egg.em.kotlin.ui.viewModels.AuthViewModel
import java.lang.IllegalArgumentException

class ViewModelFactory(private val repository: BaseRepository) : ViewModelProvider.NewInstanceFactory() {
    override fun <T : ViewModel?> create(modelClass: Class<T>): T {
        return when {
            modelClass.isAssignableFrom(AuthViewModel::class.java) -> AuthViewModel(repository as AuthRepository) as T

            else -> throw IllegalArgumentException("ViewModelClass Not Found")
        }
    }
}