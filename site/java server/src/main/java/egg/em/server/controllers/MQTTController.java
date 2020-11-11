package egg.em.server.controllers;

import egg.em.server.LiveTest;
import egg.em.server.daos.SensorRepository;
import egg.em.server.daos.TestRepository;
import egg.em.server.entities.dbEntities.Light;
import egg.em.server.entities.dbEntities.Sensor;
import egg.em.server.entities.dbEntities.TestEntity;
import egg.em.server.entities.liveEntities.TestDevice;
import egg.em.server.entities.requestsBodies.Device;
import egg.em.server.entities.requestsBodies.StartTestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;
import java.util.stream.Collectors;

@RestController
public class MQTTController {

    @Autowired
    private TestRepository testRepository;
    @Autowired
    private SensorRepository sensorRepository;

    @PostMapping("teststart/{uid}")
    public int startTestEndpoint(@PathVariable(value = "uid") int userId,
                                 @RequestBody StartTestBody requestBody){
        LiveTest liveTest = LiveTest.getInstance();

        if (liveTest.isInProgress()){
            return 400;
        } else {
            return startTest(userId, requestBody);
        }
    }

    private int startTest(int userId, StartTestBody requestBody) {
        LiveTest.getInstance().setInProgress(true);
        Set<Light> lights = requestBody.getDevices().stream()
                .map(d -> new Light(d.getId())).collect(Collectors.toSet());

        TestEntity test = new TestEntity(lights.size(), "In Progress", requestBody.getTestType(), lights);
        testRepository.save(test);

        Set<TestDevice> testDevices = requestBody.getDevices().stream()
                .map(d -> makeTestDeviceFromDevice(userId, test.getId(), d))
                .collect(Collectors.toSet());

        LiveTest.getInstance().init(testDevices, test, userId);

        return 200;
    }

    private TestDevice makeTestDeviceFromDevice(long user, long testId, Device device){
        Set<Sensor> sensors = sensorRepository.findByParentId(device.getId());
        return new TestDevice(user, testId, device.getNodeId(), sensors);
    }
}
