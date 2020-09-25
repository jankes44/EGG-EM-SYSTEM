package egg.em.activities.fragments;

import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.google.android.material.card.MaterialCardView;

import org.json.JSONObject;

import java.util.Locale;

import egg.em.R;

public class SiteFragment extends Fragment {

    private JSONObject siteJson;

    public SiteFragment(JSONObject siteJson) {
        this.siteJson = siteJson;
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View inflate = inflater.inflate(R.layout.site_fragment, container, false);

        Log.d("SITE TAB", "CREATE VIEW");

        LinearLayout rootLayout = inflate.findViewById(R.id.siteFragmentRoot);
        TextView title = rootLayout.findViewById(R.id.siteName);
        title.setText(String.format(Locale.ENGLISH, "Manage your site - %s", siteJson.optString("name")));

        LinearLayout cardRow = new LinearLayout(getContext());
        cardRow.setOrientation(LinearLayout.HORIZONTAL);

        for (String building : siteJson.optString("buildings", "").split(", ")) {
            Log.d("SITE TAB", "BUILDING " + building);
            View buildingCard = makeBuildingCard(building, getContext());
            cardRow.addView(buildingCard);
        }

        rootLayout.addView(cardRow);

        return inflate;

    }

    private View makeBuildingCard(String siteName, Context context){
        View inflate = View.inflate(context, R.layout.site_card, null);
        TextView tv = inflate.findViewById(R.id.card_site_name);
        tv.setText(siteName);

        return inflate;
    }
}
