// Prefer real mobile world tracking. Fall back once only for an unavailable
// motion/session capability; never retry camera denial or hide arbitrary bugs.
export async function startXR8Session(XR8, {canvas, targets, modules, isStopped=()=>false}) {
  const mobile=XR8.XrDevice.isDeviceBrowserCompatible({allowedDevices:XR8.XrConfig.device().MOBILE});
  async function run(worldEnabled) {
    if (isStopped()) return;
    XR8.XrController.configure({disableWorldTracking:!worldEnabled,imageTargetData:targets});
    XR8.addCameraPipelineModules(modules(worldEnabled));
    await XR8.run({canvas,allowedDevices:XR8.XrConfig.device().ANY,
      cameraConfig:{direction:XR8.XrConfig.camera().BACK}});
  }
  try { await run(mobile); }
  catch(error) {
    const reason=[error?.message,error?.type,error?.source,error?.err,String(error)].join(' ');
    if (!mobile||isStopped()||!/No valid session manager|(?:MISSING|DENY|DENIED)_DEVICE_(?:ORIENTATION|MOTION)/i.test(reason)) throw error;
    console.warn('World tracking unavailable; continuing with image tracking.',reason);
    XR8.stop(); XR8.clearCameraPipelineModules();
    await run(false);
  }
}
