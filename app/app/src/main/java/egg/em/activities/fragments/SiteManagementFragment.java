package egg.em.activities.fragments;

import android.os.Build;
import android.os.Bundle;
import android.util.Pair;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.fragment.app.Fragment;

import com.google.android.material.tabs.TabLayout;

import java.util.concurrent.ExecutionException;

import egg.em.R;
import egg.em.operations.GetSitesOperation;

@RequiresApi(api = Build.VERSION_CODES.N)
public class SiteManagementFragment extends Fragment {

    View inflate;


    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        inflate = inflater.inflate(R.layout.site_management_fragment, container, false);
        return inflate;
    }

    @Override
    public void onStart() {
        super.onStart();
        try {
            TabLayout tabLayout = new GetSitesOperation().execute(new Pair<>(getContext(), getChildFragmentManager())).get();
            LinearLayout root = inflate.findViewById(R.id.siteTabRoot);
            root.addView(tabLayout);
        } catch (ExecutionException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
