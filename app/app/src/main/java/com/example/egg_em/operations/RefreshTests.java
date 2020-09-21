package com.example.egg_em.operations;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.os.Handler;
import android.util.Pair;

import androidx.annotation.RequiresApi;

import com.example.egg_em.classes.Utilities;
import com.example.egg_em.classes.singletons.LoggedUser;
import com.example.egg_em.classes.types.RequestType;
import com.example.egg_em.operations.params.TestParams;

import org.json.JSONObject;

import java.util.concurrent.ExecutionException;

@RequiresApi(api = Build.VERSION_CODES.N)
public class RefreshTests implements Runnable {

    private Context context;
    private Activity activity;
    private Handler handler = new Handler();

    private JSONObject result;

    public RefreshTests(Context context, Activity activity) {
        this.context = context;
        this.activity = activity;
    }

    @Override
    public void run() {
        LoggedUser user = LoggedUser.getInstance(null);
        TestParams trialTestParams = new TestParams(user.getId(), user.getToken(), RequestType.TRIAL_TESTS, context);

        try {
            Pair<Integer, JSONObject> trialTests = new TestOperation().execute(trialTestParams).get();

        } catch (ExecutionException | InterruptedException e) {
            Utilities.createToast("Error loading last tests", activity);
        }

        handler.postDelayed(this, 10000);
    }

    public JSONObject getResult() {
        return result;
    }
}
