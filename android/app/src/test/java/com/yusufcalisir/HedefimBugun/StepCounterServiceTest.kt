package com.yusufcalisir.HedefimBugun

import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorManager
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config
import java.text.SimpleDateFormat
import java.util.*

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class StepCounterServiceTest {

    private lateinit var service: StepCounterService
    private lateinit var context: Context
    private lateinit var sharedPreferences: SharedPreferences
    private lateinit var sdf: SimpleDateFormat

    @Before
    fun setUp() {
        context = RuntimeEnvironment.getApplication()
        service = spy(StepCounterService())
        doReturn(context).`when`(service).applicationContext
        
        sharedPreferences = context.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
        sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        
        // Clear prefs before each test
        sharedPreferences.edit().clear().apply()
    }

    @Test
    fun `test updateSteps - normal increment`() {
        val today = sdf.format(Date())
        sharedPreferences.edit()
            .putString("lastSavedDay", today)
            .putInt("baseSteps", 1000)
            .apply()

        // 1100 total steps since boot, base is 1000 -> 100 today steps
        val method = StepCounterService::class.java.getDeclaredMethod("updateSteps", Int::class.java)
        method.isAccessible = true
        method.invoke(service, 1100)

        assertEquals(100, sharedPreferences.getInt("todaySteps", 0))
    }

    @Test
    fun `test updateSteps - new day detection`() {
        val yesterday = "2020-01-01" // Definitely not today
        val today = sdf.format(Date())
        
        sharedPreferences.edit()
            .putString("lastSavedDay", yesterday)
            .putInt("baseSteps", 500)
            .apply()

        // New day: baseSteps should be reset to current totalStepsSinceBoot
        val method = StepCounterService::class.java.getDeclaredMethod("updateSteps", Int::class.java)
        method.isAccessible = true
        method.invoke(service, 1000)

        assertEquals(today, sharedPreferences.getString("lastSavedDay", ""))
        assertEquals(1000, sharedPreferences.getInt("baseSteps", -1))
        assertEquals(0, sharedPreferences.getInt("todaySteps", -1))
    }

    @Test
    fun `test updateSteps - reboot detection`() {
        val today = sdf.format(Date())
        sharedPreferences.edit()
            .putString("lastSavedDay", today)
            .putInt("baseSteps", 5000) // Before reboot, base was 5000
            .apply()

        // After reboot: totalStepsSinceBoot is small (e.g., 10)
        // Since 10 < 5000, baseSteps should reset to 10
        val method = StepCounterService::class.java.getDeclaredMethod("updateSteps", Int::class.java)
        method.isAccessible = true
        method.invoke(service, 10)

        assertEquals(10, sharedPreferences.getInt("baseSteps", -1))
        assertEquals(0, sharedPreferences.getInt("todaySteps", -1))
    }

    @Test
    fun `test updateSteps - broadcast intent`() {
        val today = sdf.format(Date())
        sharedPreferences.edit()
            .putString("lastSavedDay", today)
            .putInt("baseSteps", 1000)
            .apply()

        val method = StepCounterService::class.java.getDeclaredMethod("updateSteps", Int::class.java)
        method.isAccessible = true
        method.invoke(service, 1500)

        // Verifying broadcast - this is tricky with Robolectric but we can check if sendBroadcast was called
        // We spied on the service above
        verify(service).sendBroadcast(any())
    }
}
