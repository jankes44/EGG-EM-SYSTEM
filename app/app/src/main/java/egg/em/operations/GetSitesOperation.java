package egg.em.operations;

import android.content.Context;
import android.os.AsyncTask;
import android.os.Build;
import android.util.Log;
import android.util.Pair;
import android.view.View;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.RequiresApi;
import androidx.fragment.app.Fragment;
import androidx.fragment.app.FragmentManager;
import androidx.fragment.app.FragmentStatePagerAdapter;
import androidx.viewpager.widget.ViewPager;

import com.google.android.material.card.MaterialCardView;
import com.google.android.material.tabs.TabItem;
import com.google.android.material.tabs.TabLayout;

import org.json.JSONArray;
import org.json.JSONObject;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.Collections;
import java.util.Locale;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

import egg.em.R;
import egg.em.activities.fragments.SiteFragment;
import egg.em.classes.Utilities;
import egg.em.classes.adapters.TabAdapter;
import egg.em.classes.singletons.LoggedUser;

@RequiresApi(api = Build.VERSION_CODES.N)
public class GetSitesOperation extends AsyncTask<Pair<Context, FragmentManager>, Integer, TabLayout> {

    private static String URL = "http://63.32.97.125:5000/api/sites/%d";

    @Override
    protected TabLayout doInBackground(Pair<Context, FragmentManager>... params) {
        LoggedUser user = LoggedUser.getInstance(null);

        String completeUrl = String.format(Locale.ENGLISH, URL, user.getId());
        URL url;
        try {
            url = new URL(completeUrl);
        } catch (MalformedURLException e) {
            Log.e("EXCEPTION", e.toString());
            return null;
        }

        Context context = params[0].first;
        Pair<Integer, JSONArray> result = Utilities.getRequestForJsonArray(url, user.createAuthHeader());

        TabLayout tabLayout = new TabLayout(context);
        ViewPager viewPager = new ViewPager(context);
        TabAdapter adapter = new TabAdapter(params[0].second, FragmentStatePagerAdapter.POSITION_UNCHANGED);

        viewPager.addOnPageChangeListener(new TabLayout.TabLayoutOnPageChangeListener(tabLayout));

        if (result.first.equals(200)){
            JSONArray sites = result.second;
            IntStream.range(0, sites.length()).parallel()
                    .mapToObj(index -> Utilities.getJsonObjectByIndex(sites, index))
                    .map(this::makeSiteTab)
                    .forEach(tab -> adapter.addFragment(tab.first, tab.second));
        }

        viewPager.setAdapter(adapter);
        tabLayout.setupWithViewPager(viewPager);
        return tabLayout;
    }

    private Pair<Fragment, String> makeSiteTab(JSONObject site){
        Log.d("SITE TAB", site.toString());
        return new Pair<>(new SiteFragment(site), site.optString("name"));
    }
}
