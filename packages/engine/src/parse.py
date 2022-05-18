# coding=utf-8

# @Author: Kanata You 
# @Date: 2022-03-19 23:12:30 

import sys
import time
import speech_recognition as sr
import os


def parse(webm, lang='en-EN'):
  r = sr.Recognizer()

  file = webm.replace('.webm', '.wav')
  ffmpeg = os.path.abspath(os.path.join('..', '..', 'lib', 'ffmpeg', 'bin', 'ffmpeg.exe'))
  command = f"{ffmpeg} -loglevel quiet -i {webm} -ac 1 -ar 16000 {file}"
  os.system(command)

  with sr.AudioFile(file) as source:
    audio = r.record(source)
    pass

    r.adjust_for_ambient_noise(source)
    # print("Set minimum energy threshold to {}".format(r.energy_threshold))

    try:
      res = r.recognize_google(audio, show_all=True, language='zh-cn')

      if type(res) is list and len(res) == 0:
        return '[]'

      return res["alternative"]
    except sr.UnknownValueError:
      return '[]'
    except RuntimeError as error:
      raise error

    pass

  pass


if __name__ == '__main__':
  try:
    result = parse(sys.argv[1], lang=sys.argv[2])
    print(result, end="")
    exit(0)
  except RuntimeError as err:
    print(err)
    exit(1)
  pass
