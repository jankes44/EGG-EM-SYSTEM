package com.example.egg_em.activities;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.widget.Toolbar;

import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.ui.AppBarConfiguration;
import androidx.navigation.ui.NavigationUI;

import com.example.egg_em.R;
import com.example.egg_em.classes.singletons.LoggedUser;
import com.google.android.material.navigation.NavigationView;

import java.util.HashSet;
import java.util.Set;

import static androidx.navigation.Navigation.findNavController;

@RequiresApi(api = Build.VERSION_CODES.N)
public class MainLoggedActivity extends AppCompatActivity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LoggedUser user = LoggedUser.getInstance(null);
        setContentView(R.layout.logged);

        NavigationView navigationView = findViewById(R.id.nav_view);

        Set<Integer> topLevelDestinations = new HashSet<>();
        topLevelDestinations.add(R.id.dashboardFragment);
        topLevelDestinations.add(R.id.userProfileFragment);
        topLevelDestinations.add(R.id.testHistoryFragment);

        AppBarConfiguration appBarConfiguration = new AppBarConfiguration
                .Builder(topLevelDestinations)
                .build();

        NavController navController = findNavController(this, R.id.nav_host_fragment);
        NavigationUI.setupWithNavController(navigationView, navController);
        NavigationUI.setupActionBarWithNavController(this, navController, appBarConfiguration);
    }
}
