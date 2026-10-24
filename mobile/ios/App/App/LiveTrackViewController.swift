import Capacitor
import UIKit

/// Loads the configured LiveTrack server and registers the location plugin.
@objc(LiveTrackViewController)
class LiveTrackViewController: CAPBridgeViewController {
    override func instanceDescriptor() -> InstanceDescriptor {
        let descriptor = super.instanceDescriptor()
        if let url = LiveTrackServerUrl.resolve() {
            descriptor.serverURL = url
        }
        return descriptor
    }

    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(LiveTrackPlugin())
    }
}
