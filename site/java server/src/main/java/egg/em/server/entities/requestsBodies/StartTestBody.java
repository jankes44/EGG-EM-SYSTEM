package egg.em.server.entities.requestsBodies;

import lombok.Data;

import java.util.List;

@Data
public class StartTestBody {
    List<Device> devices;
    String testType;

    public List<Device> getDevices() {
        return devices;
    }

    public String getTestType() {
        return testType;
    }
}
