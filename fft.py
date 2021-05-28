
import math

def cis(v, doinverse):

	if doinverse:
		v = -v

	xval = math.cos(2 * v * math.pi)
	yval = math.sin(2 * v * math.pi)
	return complex(xval, yval)

def fft(p, doinverse): # p is the polynomial in coefficient form
	
	n = len(p)

	# base case
	if n == 1:
		return [complex(p[0], 0)]
	
	# split the polynomial
	eventerms = []
	oddterms = []

	for i in range(n):
		if i % 2 == 0:
			eventerms.append(p[i])
		else:
			oddterms.append(p[i])

	# divide and conquer
	eventerms = fft(eventerms, doinverse)
	oddterms = fft(oddterms, doinverse)

	res = [None for i in range(n)]
	
	for i in range(len(eventerms)):

		v1 = cis(i/n, doinverse)
		v2 = cis((i + n//2)/n, doinverse)
		
		res[i] = eventerms[i] + (oddterms[i] * v1)
		res[i + n//2] = eventerms[i] + (oddterms[i] * v2)

	return res

def mult(p1, p2):

	pow2 = 1
	while pow2 < max(len(p1), len(p2)):
		pow2 *= 2
	pow2 *= 2

	while len(p1) < pow2:
		p1.append(0)
	while len(p2) < pow2:
		p2.append(0)

	# pad the polynomials with zeros

	r1 = fft(p1, False)
	r2 = fft(p2, False)


	for i in range(len(r1)):
		r1[i] *= r2[i]

	res = [i.real for i in fft(r1, True)]

	for i in range(len(res)):
		res[i] /= len(r1)

	return res 


p1 = [1, 1] # 1 + x
p2 = [1, 0, 0, 1] # 1 + x^3

print(mult(p1, p2)) # expected, 1 + x + x^3 + x^4
