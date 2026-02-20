package com.yusufcalisir.HedefimBugun

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || 
            intent.action == "android.intent.action.QUICKBOOT_POWERON") {
            
            // Restart the service if it was intended to be running
            val prefs = context.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
            val isTrackingActive = prefs.getBoolean("isTrackingActive", false)
            
            if (isTrackingActive) {
                val serviceIntent = Intent(context, StepCounterService::class.java)
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    context.startForegroundService(serviceIntent)
                } else {
                    context.startService(serviceIntent)
                }
            }
        }
    }
}
