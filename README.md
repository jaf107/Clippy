<h1 align="center">You Tube Link of Clippy</h1>
<li>https://youtu.be/gEyYHD3tCuk</li>
	</ul>
	<ul>
<h1 align="center">Live Demo</h1>
<li>http://clippyicsescore2023.s3-website-us-east-1.amazonaws.com/</li>
	</ul>
<h1 align="center">Project Title</h1>
Clippy: Smart PDF Reader for better Paper Reading Experience and Knowledge Mining

<h1 align="center">Project Description</h1>

<h3>1.1. Authentication</h3>
There are two different types of user modes in our system - <b>Guest and authenticated user</b>. A user needs to provide a full name, email, password, institution and  <br> designation to register to the system. A 6 digit OTP will be sent to email for verification. Users can log in with email and password. After a successful login users  <br> can access tools that allow him or her to maintain track of previously read research publications.<br>
<h3>1.2. Searching a Paper</h3>
A user can search paper in two ways:<b> By uploading the PDF manually or by searching by the Paper Title</b>. If a user searches using the paper title, <br> a list of related papers will be displayed. Among the displayed papers, users can select a paper. <br> After selection of the paper, they will get three options:
Cross Referencing of Objects
Summarization of PDF
Generating a knowledge Graph<br>
<h3>1.3. Cross Referencing of Objects </h3>
A PDF usually contains a number of figures, tables, charts etc. It references other papers as well. For efficient and easy PDF reading, <br> Clippy supports cross referencing of the objects. Clippy works in two modes: <b> Automatic cross referencing mode <br> and manual cross referencing  mode </b>. When automatic cross referencing is called , the referenced objects will be shown in a popup overlay whenever the reader hovers over the reference keyword annotation <br> In manual cross referencing mode, when a user hovers over a keyword of figure and table,<br> a pop over window will be displayed containing the cropped window of a <br> particulur images or tables.
<h3>1.4. Building a knowledge graph </h3>
A research paper usually references other papers. The referenced papers may have citations among themselves too. <br> Clippy will generate a knowledge graph showing the citations within the paper, also the interrelation among the cited papers too. <br> A user will be able to determine the sequence of study for research articles with the <b> aid of the knowledge graph</b>.<br>
<h3>1.5. Summary of Important Elements </h3>
A research paper's essential components include an abstract, background information, <br> references, methodology, experiment baselines, and result analysis. Summarizing the important elements may help a reader in grabbing the quicker understanding of the paper. <br> Clippy comes with two types of summarization:<b> extractive and abstractive </b>. Clippy will highlight the important sentences from the paper if extractive summary is selected. <br> A summary from each block of the paper ie. abstract, background study etc. and TLDR will be shown as a distinct PDF if the abstractive summary is selected.
All the summary generated by Clippy can be exported as PDF.

<h1 align="center">Prerequisites</h1>
	<ul>
		<li>Node.js</li>
		<li>MongoDB</li>
  	<li>Angular</li>
		<li>Express.js</li>
	</ul>
	
<h1 align="center">Scopes and Limitations</h1>
	<ol>
		<li>For extractive summarizing, we used the free version of the meaning cloud api, and for abstractive summary, we used the one ai api.
That is why,we are now only allowed to use the api 20,000 times per month.
		</li>
		<li>File organization should follow a consistent format. If not, it's likely that the pdf.js library won't be able to locate text chunks correctly.
Note that pdf.js is a prerequisite for this project.
		</li>
<li>Citation graph will not be shown if the software can not find the paper in semantic scholar.
		</li>	
  	</ol>
	
<h1 align="center">Installation</h1>
	<ol>
		<li>Clone the repository:</li>
		<pre><code>git clone https://github.com/jaf107/Clippy.git</code></pre>
		<li>Install the dependencies:</li>
  		<pre><code>cd frontend</code>
<code>npm install --save</code></pre>
		<li>Start the application:
			<ul>
				<li>If angular cli is installed globally: </li>
				<pre><code>ng serve</code></pre>
				<li>If not then: </li>
				<pre><code>npm start</code></pre>
			</ul>
		</li>		
		<li>Open a web browser and go to <a href="http://localhost:4200">http://localhost:4200</a></li>
		<li>Install the dependencies:</li>
	<pre><code>npm install</code></pre>
		<li>Start the backend</li>
<pre><code>cd server</code>
<code>npm start</code></pre>
  	</ol>
	<ul>
		<h1 align="center">Contributors</h1>
		<pre><li>Md Siam				bsse1104@iit.du.ac.bd		University of Dhaka</li></pre>
	<pre><li>Abu Jafar Saifullah		bsse1109@iit.du.ac.bd		University of Dhaka</li></pre>
		<pre><li>Kazi Muktadir Ahmed		bsse1111@iit.du.ac.bd		University of Dhaka</li></pre>
		<pre><li>Mustahid Hasan			bsse1114@iit.du.ac.bd		University of Dhaka</li></pre>
		<pre><li>Jitesh Sureka			bsse1115@iit.du.ac.bd		University of Dhaka</li></pre>
		<pre><li>Tasmia Zerin			bsse1128@iit.du.ac.bd		University of Dhaka</li></pre>
	</ul>
	<ul>

	
	
