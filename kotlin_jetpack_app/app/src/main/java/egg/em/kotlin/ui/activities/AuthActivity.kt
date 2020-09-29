package egg.em.kotlin.ui.activities

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import egg.em.kotlin.R
import net.simplifiedcoding.data.UserPreferences


class AuthActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_auth)
    }
}