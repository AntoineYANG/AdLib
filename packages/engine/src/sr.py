# @Author: Kanata You 
# @Date: 2022-03-13 21:42:54 

import time
import speech_recognition as sr
from speech_recognition import WaitTimeoutError


def start():
  r = sr.Recognizer()
  m = sr.Microphone()

  print("A moment of silence, please...")
  with m as source:
    r.adjust_for_ambient_noise(source)
  print("Set minimum energy threshold to {}".format(r.energy_threshold))

  def callback(recognizer_instance, audio):
    print('!')
    try:
      # recognize speech using Google Speech Recognition
      value = r.recognize_google(audio)
      print(f'"{value}"')
    except sr.UnknownValueError:
      print('(none)')
      pass
    except sr.RequestError as e:
      print("Uh oh! Couldn't request results from Google Speech Recognition service; {0}".format(e))
    pass
    return

  print('say')
  r.listen_in_background(source, callback, 200)

  try:
    while True:
      time.sleep(1)
    pass
  except KeyboardInterrupt:
    pass
