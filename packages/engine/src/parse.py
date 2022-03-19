# @Author: Kanata You 
# @Date: 2022-03-19 23:12:30 

import sys
import time
import speech_recognition as sr


def parse(file, lang='en-EN'):
  r = sr.Recognizer()

  with sr.AudioFile(file) as source:
    audio = r.record(source)
    pass

  r.adjust_for_ambient_noise(source)
  print("Set minimum energy threshold to {}".format(r.energy_threshold))

  try:
    res = r.recognize_google(audio, show_all=True, language=lang)
    print(res)

    print('prefer', res['prefer'])
    print('conf', res['alternative'][0]['confidence'])
    return res
  except sr.UnknownValueError:
    return ''
  except RuntimeError as error:
    raise error

  pass


if __name__ == '__main__':
  try:
    result = parse()
    exit(0)
  except:
    exit(1)
  pass
