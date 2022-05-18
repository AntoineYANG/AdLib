# @Author: Kanata You 
# @Date: 2022-03-13 21:42:54 

import sys
import time
import speech_recognition as sr
# from speech_recognition import WaitTimeoutError


def colorize(text, value):
  prefix = "\x1B[31m"
  
  if value >= 0.8:
    prefix = "\x1B[32m"
  elif value >= 0.6:
    prefix = "\x1B[33m"

  return f'{prefix}{text}\x1B[0m'


def clear():
  # sys.stdout.write('\r' + ' ' * 40 + '\r')
  # sys.stdout.flush()
  return


key_words = {
  'ja': {
    '撤回': clear,
    '撤回する': clear,
    '訂正': clear
  }
}


def start():
  lang = ['ja', 'en-US', 'en-EN', 'zh-CN'][2]

  r = sr.Recognizer()
  m = sr.Microphone()

  methods = [
    # # CMU Sphinx
    # ["sphinx", r.recognize_sphinx],
    # Google Web Speech API
    ["google", r.recognize_google],
    # # Google Cloud Speech
    # ["google cloud", r.recognize_google_cloud],
    # # Wit.ai
    # ["wit", r.recognize_wit],
    # # Microsoft Bing Speech
    # ["bing", r.recognize_bing],
    # # Houndify by SoundHound
    # ["houndify", r.recognize_houndify],
    # # IBM Speech to Text
    # ["ibm", r.recognize_ibm]
  ]

  print("A moment of silence, please...")
  with m as source:
    r.adjust_for_ambient_noise(source)
  print("Set minimum energy threshold to {}".format(r.energy_threshold))

  def callback(recognizer_instance, audio):
    msg = '\x1B[3m(analyzing...)\x1B[0m'
    # print('\b' * len(msg))
    sys.stdout.write('\r' + msg)
    sys.stdout.flush()
    receive_time = time.time()
    show_all = False
    values = {}
    for method in methods:
      values[method[0]] = None
      try:
        values[method[0]] = {
          "prefer": method[1](audio, show_all=show_all, language=lang),
          "list": method[1](audio, show_all=True, language=lang),
          "time": time.time() - receive_time
        }
      except sr.UnknownValueError:
        pass
      except RuntimeError as error:
        print(error)
        continue
      pass
    # print('\b' * len(msg))
    sys.stdout.write('\r')
    sys.stdout.flush()
    if values["google"]:
      # print('[C]', values["sphinx"]["prefer"])
      # print(
      #   '[G]',
      #   colorize(
      #     values["google"]["prefer"],
      #     values["google"]["list"]["alternative"][0]["confidence"]
      #   ),
      #   f'({values["google"]["list"]["alternative"][0]["confidence"]})'
      # )
      # if len(values["google"]["list"]["alternative"]) > 1:
      #   for alternative in values["google"]["list"]["alternative"][1:]:
      #     print(
      #       ' - ',
      #       alternative["transcript"],
      #       f'({alternative["confidence"]})' if "confidence" in alternative else "(-1)"
      #     )
      #     pass
      #   pass
      # print()
      data = values["google"]["prefer"]

      if lang in key_words and data in key_words[lang]:
        key_words[lang][data]()
        sys.stdout.write('\n')
        sys.stdout.flush()
        return

      sys.stdout.write(' ' * (len(msg) + 2) + '\r')
      sys.stdout.write(
        colorize(
          data.capitalize(),
          values["google"]["list"]["alternative"][0]["confidence"]
        )
      )
      sys.stdout.write('\n')
      sys.stdout.flush()
      # print(
      #   colorize(
      #     values["google"]["prefer"].capitalize(),
      #     values["google"]["list"]["alternative"][0]["confidence"]
      #   )
      # )
      pass
    else:
      pass
    # try:
    #   # recognize speech using Google Speech Recognition
    #   # value = r.recognize_google(audio)
    #   value = r.recognize_sphinx(audio)
    #   print(f'"{value}"')
    # except sr.UnknownValueError:
    #   print('(none)')
    #   pass
    # except sr.RequestError as e:
    #   print("Uh oh! Couldn't request results from Google Speech Recognition service; {0}".format(e))
    # pass
    sys.stdout.write('\r\x1B[3m(listening...)\x1B[0m')
    sys.stdout.flush()
    return

  sys.stdout.write('\r\x1B[3m(listening...)\x1B[0m')
  sys.stdout.flush()
  # print('\x1B[3m(listening...)\x1B[0m')
  r.listen_in_background(source, callback, 8)

  try:
    while True:
      time.sleep(1)
    pass
  except KeyboardInterrupt:
    print('\n\x1B[3m(exit)\x1B[0m')
    pass
