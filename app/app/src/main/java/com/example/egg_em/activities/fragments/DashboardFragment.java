package com.example.egg_em.activities.fragments;

import android.os.Build;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.fragment.app.Fragment;

import com.example.egg_em.R;
import com.example.egg_em.classes.singletons.LoggedUser;

@RequiresApi(api = Build.VERSION_CODES.N)
public class DashboardFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        LoggedUser user = LoggedUser.getInstance(null);

        View inflate = inflater.inflate(R.layout.dashboard_fragment, container, false);

        TextView welcome = inflate.findViewById(R.id.welcome);
        String username = user != null ? user.getFirstName() : "Unknown";

        welcome.setText(String.format(welcome.getText().toString(), username));

        return inflate;
    }
}
