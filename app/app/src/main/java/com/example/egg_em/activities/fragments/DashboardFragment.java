package com.example.egg_em.activities.fragments;

import android.app.Activity;
import android.os.Build;
import android.os.Bundle;
import android.util.Pair;
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
import com.example.egg_em.classes.types.RequestType;
import com.example.egg_em.operations.GetLastTestOperation;
import com.example.egg_em.operations.params.TestParams;

import org.json.JSONException;
import org.json.JSONObject;

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
            activity.runOnUiThread(() -> lastTestText.setText(getLastTest()));
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

    private String getLastTest(){
        TestParams lastTestParams = new TestParams(user.getId(), user.getToken(), RequestType.LAST_TEST, this.getContext());
        try {
            Pair<Integer, String> lastTest = new GetLastTestOperation().execute(lastTestParams).get();
            if (lastTest.first.equals(200)) {
                JSONObject lastTestJSON = new JSONObject(lastTest.second);
                String[] tmpDate = (lastTestJSON.getString("created_at").split("T")[0]).split("-");
                StringBuilder sb = new StringBuilder();
                for (int i = tmpDate.length - 1; i >= 1; i--) {
                    sb.append(tmpDate[i]).append("-");
                }
                sb.append(tmpDate[0]);
                String cleanDate = sb.toString();

                return String.format("%s - %s", lastTestJSON.get("building"), cleanDate);
            }
        } catch (ExecutionException | InterruptedException | JSONException ignored) {}
        return "";
    }
}
