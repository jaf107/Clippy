<h1 align="center">Project Title</h1>
Clippy: Smart PDF Reader for better Paper Reading Experience and Knowledge Mining

<h1 align="center">Project Description</h1>

<h3>1.1. Authentication</h3>
There are two different types of user modes in our system - Guest and authenticated user. A user needs to provide a full name, email, password, institution and  <br> designation to register to the system. A 6 digit OTP will be sent to email for verification. Users can log in with email and password. After a successful login users  <br> can access tools that allow him or her to maintain track of previously read research publications.<br>
<h3>1.2. Searching a Pape</h3>
A user can search paper in two ways: By uploading the PDF manually or by searching by the Paper Title. If a user searches using the paper title, <br> a list of related papers will be displayed. Among the displayed papers, users can select a paper. <br> After selection of the paper, they will get three options:
Cross Referencing of Objects
Summarization of PDF
Generating a knowledge Graph<br>
<h3>1.3. Cross Referencing of Objects </h3>
A PDF usually contains a number of figures, tables, charts etc. It references other papers as well. For efficient and easy PDF reading, <br> Clippy supports cross referencing of the objects. Clippy works in two modes: cross referencing enabled mode and cross referencing disabled mode. When cross referencing is enabled, the referenced objects will be shown in a popup overlay whenever the reader hovers over the reference keyword. <br>
<h3>1.4. Building a knowledge graph </h3>
A research paper usually references other papers. The referenced papers may have citations among themselves too. <br> Clippy will generate a knowledge graph showing the citations within the paper, also the interrelation among the cited papers too. <br> A user will be able to determine the sequence of study for research articles with the aid of the knowledge graph.<br>
<h3>1.5. Summary of Important Elements </h3>
A research paper's essential components include an abstract, background information, <br> references, methodology, experiment baselines, and result analysis. Summarizing the important elements may help a reader in grabbing the quicker understanding of the paper. <br> Clippy comes with two types of summarization: extractive and abstractive. Clippy will highlight the important sentences from the paper if extractive summary is selected. <br> A summary from each block of the paper ie. abstract, background study etc. and TLDR will be shown as a distinct PDF if the abstractive summary is selected.
All the summary generated by Clippy can be exported as PDF.


<h1 align="center">Prerequisites</h1>
	<ul>
		<li>Node.js</li>
		<li>MongoDB</li>
  	<li>Angular</li>
		<li>Express.js</li>
	</ul>
<h1 align="center">Installation</h1>
	<ol>
		<li>Clone the repository:</li>
		<pre><code>git clone https://github.com/jaf107/clippy.git</code></pre>
		<li>Install the dependencies:</li>
  <pre><code>cd frontend</code>
  <code>npm install --save</code></pre>
		<li>Start the application:</li>
		<pre><code>ng serve</code></pre>
		<li>Open a web browser and go to <a href="http://localhost:4200">http://localhost:4200</a></li>
	<li>Start the backend</li>
		<li>Install the dependencies:</li>
  <pre><code>cd backend</code></pre>
		<li>Start the application:</li>
		<pre><code>npm start</code></pre>
		<li>Open a web browser and go to <a href="http://localhost:3000">http://localhost:3000</a></li>
	</ol>
  




