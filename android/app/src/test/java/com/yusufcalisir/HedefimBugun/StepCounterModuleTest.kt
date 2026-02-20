package com.yusufcalisir.HedefimBugun

import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.mockito.ArgumentMatchers.any
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.MockitoAnnotations
import org.robolectric.RobolectricTestRunner
import org.robolectric.RuntimeEnvironment
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [33])
class StepCounterModuleTest {

    private lateinit var module: StepCounterModule
    private lateinit var reactContext: ReactApplicationContext
    
    @Mock
    private lateinit var promise: Promise

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        reactContext = spy(ReactApplicationContext(RuntimeEnvironment.getApplication()))
        module = StepCounterModule(reactContext)
    }

    @Test
    fun `test startTracking - success`() {
        module.startTracking(promise)
        
        // Verify preference updated
        val prefs = reactContext.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
        assert(prefs.getBoolean("isTrackingActive", false))
        
        // Verify promise resolved
        verify(promise).resolve(true)
    }

    @Test
    fun `test stopTracking - success`() {
        module.stopTracking(promise)
        
        // Verify preference updated
        val prefs = reactContext.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
        assert(!prefs.getBoolean("isTrackingActive", true))
        
        // Verify promise resolved
        verify(promise).resolve(true)
    }

    @Test
    fun `test getTodaySteps - returns correct value`() {
        val prefs = reactContext.getSharedPreferences("StepCounterPrefs", Context.MODE_PRIVATE)
        prefs.edit().putInt("todaySteps", 555).apply()
        
        module.getTodaySteps(promise)
        
        verify(promise).resolve(555)
    }
}
