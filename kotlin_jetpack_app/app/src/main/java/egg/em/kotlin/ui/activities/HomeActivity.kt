package egg.em.kotlin.ui.activities

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.navigation.Navigation
import androidx.navigation.ui.AppBarConfiguration
import androidx.navigation.ui.NavigationUI
import com.google.android.material.navigation.NavigationView
import egg.em.kotlin.R
import java.util.*

class HomeActivity() : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.logged)

        val navigationView = findViewById<NavigationView>(R.id.nav_view)
        val topLevelDestinations: MutableSet<Int> = HashSet()
        topLevelDestinations.add(R.id.dashboardFragment)
        topLevelDestinations.add(R.id.userProfileFragment)
        topLevelDestinations.add(R.id.testHistoryFragment)

        val appBarConfiguration = AppBarConfiguration
            .Builder(topLevelDestinations)
            .build()

        val navController = Navigation.findNavController(this, R.id.nav_host_fragment)
        NavigationUI.setupWithNavController(navigationView, navController)
        NavigationUI.setupActionBarWithNavController(this, navController, appBarConfiguration)

    }
}