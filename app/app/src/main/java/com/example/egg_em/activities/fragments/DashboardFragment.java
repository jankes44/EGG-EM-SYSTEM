package com.example.egg_em.activities.fragments;

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
import com.example.egg_em.classes.Utilities;
import com.example.egg_em.classes.singletons.LoggedUser;
import com.example.egg_em.classes.types.RequestType;
import com.example.egg_em.operations.TestOperation;
import com.example.egg_em.operations.params.TestParams;

import org.json.JSONException;
import org.json.JSONObject;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.concurrent.ExecutionException;

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

        // Populate last test information
        TestParams lastTestParams = new TestParams(user.getId(), user.getToken(), RequestType.LAST_TEST, this.getContext());
        try {
            Pair<Integer, JSONObject> lastTest = new TestOperation().execute(lastTestParams).get();
            if (lastTest.first.equals(200)){
                JSONObject lastTestJSON = lastTest.second;
                TextView areaText = (TextView) inflate.findViewById(R.id.area_name_placeholder);
                TextView lastTestText = inflate.findViewById(R.id.last_test_placeholder);

                areaText.setText("Scottish Parliament"); //TODO remove hard encoded name

                //Convert Date
                String[] tmpDate = (lastTestJSON.getString("created_at").split("T")[0]).split("-");
                StringBuilder sb = new StringBuilder();
                for (int i = tmpDate.length - 1; i >= 1; i--) {
                    sb.append(tmpDate[i]).append("-");
                }
                sb.append(tmpDate[0]);
                String cleanDate = sb.toString();

                lastTestText.setText(String.format("%s - %s", lastTestJSON.get("building"), cleanDate));
            }
        } catch (ExecutionException | InterruptedException | JSONException e) {
            Utilities.createToast("Error loading last test", this.getActivity());
            return null;
        }

        return inflate;
    }
}
