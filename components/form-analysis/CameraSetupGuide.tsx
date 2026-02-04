"use client";

export default function CameraSetupGuide() {
    return (
        <div className="card bg-base-200 border border-base-300">
            <div className="card-body">
                <h3 className="card-title text-sm">Camera Setup Tips</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex gap-2">
                        <span className="text-primary font-bold">1.</span>
                        <div>
                            <p className="font-medium">Distance</p>
                            <p className="text-base-content/60">Place your camera 6-10 feet away so your full body is visible.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-primary font-bold">2.</span>
                        <div>
                            <p className="font-medium">Lighting</p>
                            <p className="text-base-content/60">Face a light source. Avoid backlit setups where you appear as a silhouette.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-primary font-bold">3.</span>
                        <div>
                            <p className="font-medium">Angle</p>
                            <p className="text-base-content/60">Position the camera at chest/waist height, straight on or at a slight angle.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <span className="text-primary font-bold">4.</span>
                        <div>
                            <p className="font-medium">Background</p>
                            <p className="text-base-content/60">Use a clean, uncluttered background so the AI can focus on your form.</p>
                        </div>
                    </div>
                </div>
                <p className="text-xs text-base-content/40 mt-2">
                    You can also talk to your AI coach during the session -- ask questions like &quot;Was that better?&quot; or &quot;What should I focus on?&quot;
                </p>
            </div>
        </div>
    );
}
