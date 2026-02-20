package com.yusufcalisir.HedefimBugun

import android.app.*
import android.content.Context
import android.content.Intent
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import java.text.SimpleDateFormat
import java.util.*

class StepCounterService : Service(), SensorEventListener {

    private lateinit var sensorManager: SensorManager
    private var stepCounterSensor: Sensor? = null
    private val CHANNEL_ID = "StepCounterChannel"
    private val NOTIFICATION_ID = 42

    override fun onCreate() {
        super.onCreate()
        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager
        stepCounterSensor = sensorManager.getDefaultSensor(Sensor.TYPE_STEP_COUNTER)
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification("Adım sayar aktif", "Bugünkü adımların takip ediliyor.")
        startForeground(NOTIFICATION_ID, notification)

        stepCounterSensor?.let {
            sensorManager.registerListener(this, it, SensorManager.SENSOR_DELAY_UI)
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onSensorChanged(event: SensorEvent?) {
        if (event?.sensor?.type == Sensor.TYPE_STEP_COUNTER) {
            val totalStepsSinceBoot = event.values[0].toInt()
            updateSteps(totalStepsSinceBoot)
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    private fun updateSteps(totalStepsSinceBoot: Int) {
        val prefs = getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        
        val lastSavedDay = prefs.getString("lastSavedDay", "")
        var baseSteps = prefs.getInt("baseSteps", -1)
        
        // New day detection
        if (today != lastSavedDay) {
            baseSteps = totalStepsSinceBoot
            prefs.edit().apply {
                putString("lastSavedDay", today)
                putInt("baseSteps", baseSteps)
                apply()
            }
        }

        // Handle reboot: if total < base, reset base to total
        if (totalStepsSinceBoot < baseSteps) {
            baseSteps = totalStepsSinceBoot
            prefs.edit().putInt("baseSteps", baseSteps).apply()
        }

        val todaySteps = totalStepsSinceBoot - baseSteps
        prefs.edit().putInt("todaySteps", todaySteps).apply()

        // Update notification
        val notification = createNotification("Hedefim Bugün", "Bugün $todaySteps adım attın!")
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(NOTIFICATION_ID, notification)

        // Broadcast to RN if activity is running
        val broadcastIntent = Intent("StepCounterUpdate")
        broadcastIntent.`package` = packageName
        broadcastIntent.putExtra("steps", todaySteps)
        sendBroadcast(broadcastIntent)
    }

    private fun createNotification(title: String, content: String): Notification {
        val pendingIntent: PendingIntent =
            Intent(this, MainActivity::class.java).let { notificationIntent ->
                PendingIntent.getActivity(this, 0, notificationIntent, 
                    PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
            }

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(android.R.drawable.ic_menu_directions) // Use a system icon for now
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Adım Sayar Servisi",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(serviceChannel)
        }
    }

    override fun onDestroy() {
        sensorManager.unregisterListener(this)
        super.onDestroy()
    }
}
