package com.example.egg_em.activities.fragments;

import android.app.Activity;
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
import com.example.egg_em.operations.GetLastTestOperation;

import java.util.Timer;
import java.util.TimerTask;
import java.util.concurrent.ExecutionException;

@RequiresApi(api = Build.VERSION_CODES.N)
public class DashboardFragment extends Fragment {

    TextView areaText;
    TextView lastTestText;
    LoggedUser user;
    Activity activity;
    Timer timer = new Timer();


    private final TimerTask refreshLastTest = new TimerTask() {
        @Override
        public void run() {
            String lastTest = getLastTest();
            activity.runOnUiThread(() -> lastTestText.setText(lastTest));
        }
    };

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View inflate = inflater.inflate(R.layout.dashboard_fragment, container, false);

         user = LoggedUser.getInstance(null);
         activity = getActivity();

        areaText = inflate.findViewById(R.id.area_name_placeholder);
        lastTestText = inflate.findViewById(R.id.last_test_placeholder);

        TextView welcome = inflate.findViewById(R.id.welcome);
        String username = user != null ? user.getFirstName() : "Unknown";

        welcome.setText(String.format(welcome.getText().toString(), username));

        // Populate last test information
        areaText.setText("Scottish Parliament");
        lastTestText.setText(getLastTest());


        //Last test table periodically
        timer.schedule(refreshLastTest, 7000);

        return inflate;
    }

    private String getLastTest() {
        try {
            return new GetLastTestOperation().execute(getContext()).get();
        } catch (ExecutionException | InterruptedException e) {
            return "";
        }
    }
}
