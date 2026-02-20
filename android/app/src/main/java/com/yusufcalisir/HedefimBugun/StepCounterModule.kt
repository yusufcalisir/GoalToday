package com.yusufcalisir.HedefimBugun

import android.content.*
import android.hardware.Sensor
import android.hardware.SensorManager
import android.os.Build
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class StepCounterModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var broadcastReceiver: BroadcastReceiver? = null

    override fun getName(): String = "StepCounterModule"

    init {
        setupBroadcastReceiver(reactContext)
    }

    private fun setupBroadcastReceiver(context: Context) {
        broadcastReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context, intent: Intent) {
                if (intent.action == "StepCounterUpdate") {
                    val stepsValue = intent.getIntExtra("steps", 0)
                    sendEvent("onStepsChanged", stepsValue)
                }
            }
        }
        val filter = IntentFilter("StepCounterUpdate")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            context.registerReceiver(broadcastReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            context.registerReceiver(broadcastReceiver, filter)
        }
    }

    override fun onCatalystInstanceDestroy() {
        try {
            broadcastReceiver?.let {
                reactApplicationContext.unregisterReceiver(it)
            }
        } catch (e: Exception) {
            // Already unregistered
        }
        super.onCatalystInstanceDestroy()
    }

    private fun sendEvent(eventName: String, steps: Int) {
        val params = Arguments.createMap()
        params.putInt("steps", steps)
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    @ReactMethod
    fun startTracking(promise: Promise) {
        try {
            val context = reactApplicationContext
            val serviceIntent = Intent(context, StepCounterService::class.java)
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(serviceIntent)
            } else {
                context.startService(serviceIntent)
            }
            
            val prefs = context.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
            prefs.edit().putBoolean("isTrackingActive", true).apply()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVER_ERROR", e.message)
        }
    }

    @ReactMethod
    fun stopTracking(promise: Promise) {
        try {
            val context = reactApplicationContext
            val serviceIntent = Intent(context, StepCounterService::class.java)
            context.stopService(serviceIntent)
            
            val prefs = context.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
            prefs.edit().putBoolean("isTrackingActive", false).apply()
            
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SERVER_ERROR", e.message)
        }
    }

    @ReactMethod
    fun getTodaySteps(promise: Promise) {
        val prefs = reactApplicationContext.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
        val steps = prefs.getInt("todaySteps", 0)
        promise.resolve(steps)
    }

    @ReactMethod
    fun checkSensorAvailability(promise: Promise) {
        val sensorManager = reactApplicationContext.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val sensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
        promise.resolve(sensor != null)
    }
}
